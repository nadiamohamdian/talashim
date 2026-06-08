import { BadRequestException } from '@nestjs/common';
import { InventoryMovementType, type Prisma } from '@/generated/prisma';
import { getPlatformSettings } from '@/common/platform-settings/platform-settings-runtime';

export type OrderInventoryLine = { productId: string; quantity: number };

function orderMovementNote(orderId: string, action: string, orderNumber: string) {
  return `order:${orderId} ${action} ${orderNumber}`;
}

async function findInventoryItem(tx: Prisma.TransactionClient, productId: string) {
  const item = await tx.inventoryItem.findUnique({ where: { productId } });
  if (!item) {
    throw new BadRequestException('موجودی این محصول ثبت نشده است');
  }
  return item;
}

async function hasFulfillmentMovement(tx: Prisma.TransactionClient, orderId: string) {
  const existing = await tx.inventoryMovement.findFirst({
    where: {
      type: InventoryMovementType.ORDER_FULFILLMENT,
      note: { contains: `order:${orderId}` },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function fulfillLine(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number,
  orderId: string,
  orderNumber: string,
  actorId: string | null,
) {
  const item = await findInventoryItem(tx, productId);
  const quantityBefore = item.quantity;
  const quantityAfter = quantityBefore - quantity;
  const reservedBefore = item.reserved;
  const reservedFromOrder = Math.min(reservedBefore, quantity);
  const reservedAfter = reservedBefore - reservedFromOrder;

  if (quantityAfter < 0) {
    throw new BadRequestException('موجودی کافی برای تکمیل سفارش نیست');
  }
  if (quantityAfter < reservedAfter) {
    throw new BadRequestException('موجودی نمی‌تواند کمتر از مقدار رزرو شده باشد');
  }

  await tx.inventoryItem.update({
    where: { productId },
    data: {
      quantity: quantityAfter,
      reserved: reservedAfter,
    },
  });

  await tx.inventoryMovement.create({
    data: {
      productId,
      actorId,
      type: InventoryMovementType.ORDER_FULFILLMENT,
      quantityDelta: -quantity,
      quantityBefore,
      quantityAfter,
      reservedBefore,
      reservedAfter,
      note: orderMovementNote(orderId, 'fulfill', orderNumber),
    },
  });
}

export async function applyInventoryOnCheckout(
  tx: Prisma.TransactionClient,
  orderId: string,
  orderNumber: string,
  items: OrderInventoryLine[],
) {
  const reservationEnabled = getPlatformSettings().featureFlags.enableInventoryReservation;

  for (const line of items) {
    const item = await findInventoryItem(tx, line.productId);
    const available = item.quantity - item.reserved;
    if (available < line.quantity) {
      throw new BadRequestException('موجودی کافی برای تکمیل سفارش نیست');
    }

    if (reservationEnabled) {
      const reservedBefore = item.reserved;
      const reservedAfter = reservedBefore + line.quantity;
      await tx.inventoryItem.update({
        where: { productId: line.productId },
        data: { reserved: reservedAfter },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: line.productId,
          type: InventoryMovementType.RESERVATION,
          quantityDelta: 0,
          quantityBefore: item.quantity,
          quantityAfter: item.quantity,
          reservedBefore,
          reservedAfter,
          note: orderMovementNote(orderId, 'reserve', orderNumber),
        },
      });
      continue;
    }

    await fulfillLine(tx, line.productId, line.quantity, orderId, orderNumber, null);
  }
}

export async function fulfillInventoryOnPayment(
  tx: Prisma.TransactionClient,
  orderId: string,
  orderNumber: string,
  items: OrderInventoryLine[],
  actorId: string | null,
) {
  if (!getPlatformSettings().featureFlags.enableInventoryReservation) {
    return;
  }
  if (await hasFulfillmentMovement(tx, orderId)) {
    return;
  }

  for (const line of items) {
    await fulfillLine(tx, line.productId, line.quantity, orderId, orderNumber, actorId);
  }
}

async function hasCancelMovement(tx: Prisma.TransactionClient, orderId: string) {
  const existing = await tx.inventoryMovement.findFirst({
    where: {
      type: InventoryMovementType.RELEASE,
      note: { contains: `order:${orderId} cancel` },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function restoreInventoryOnCancel(
  tx: Prisma.TransactionClient,
  orderId: string,
  orderNumber: string,
  items: OrderInventoryLine[],
  actorId: string | null,
) {
  if (await hasCancelMovement(tx, orderId)) {
    return;
  }

  const fulfilled = await hasFulfillmentMovement(tx, orderId);
  const reservationEnabled = getPlatformSettings().featureFlags.enableInventoryReservation;

  for (const line of items) {
    const item = await findInventoryItem(tx, line.productId);
    const quantityBefore = item.quantity;
    const reservedBefore = item.reserved;

    if (fulfilled) {
      const quantityAfter = quantityBefore + line.quantity;
      await tx.inventoryItem.update({
        where: { productId: line.productId },
        data: { quantity: quantityAfter },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: line.productId,
          actorId,
          type: InventoryMovementType.RELEASE,
          quantityDelta: line.quantity,
          quantityBefore,
          quantityAfter,
          reservedBefore,
          reservedAfter: reservedBefore,
          note: orderMovementNote(orderId, 'cancel-restore', orderNumber),
        },
      });
      continue;
    }

    if (!reservationEnabled || reservedBefore < line.quantity) {
      continue;
    }

    const reservedAfter = reservedBefore - line.quantity;
    await tx.inventoryItem.update({
      where: { productId: line.productId },
      data: { reserved: reservedAfter },
    });
    await tx.inventoryMovement.create({
      data: {
        productId: line.productId,
        actorId,
        type: InventoryMovementType.RELEASE,
        quantityDelta: 0,
        quantityBefore,
        quantityAfter: quantityBefore,
        reservedBefore,
        reservedAfter,
        note: orderMovementNote(orderId, 'cancel-release', orderNumber),
      },
    });
  }
}

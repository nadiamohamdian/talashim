import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateAddressDto } from '../dto/create-address.dto';
import type { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressesRepository } from '../repositories/addresses.repository';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  list(userId: string) {
    return this.addressesRepository.findByUserId(userId).then((items) =>
      items.map((address) => this.toResponse(address)),
    );
  }

  async create(userId: string, payload: CreateAddressDto) {
    const address = await this.addressesRepository.create(userId, payload);
    return this.toResponse(address);
  }

  async update(userId: string, id: string, payload: UpdateAddressDto) {
    const existing = await this.addressesRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new NotFoundException('Address not found');
    }
    const address = await this.addressesRepository.update(id, payload);
    return this.toResponse(address);
  }

  async remove(userId: string, id: string) {
    const existing = await this.addressesRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new NotFoundException('Address not found');
    }
    await this.addressesRepository.delete(id);
    return { success: true };
  }

  private toResponse(address: {
    id: string;
    title: string;
    recipient: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    createdAt: Date;
  }) {
    return {
      id: address.id,
      title: address.title,
      recipient: address.recipient,
      phone: address.phone,
      line1: address.line1,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      createdAt: address.createdAt.toISOString(),
    };
  }
}

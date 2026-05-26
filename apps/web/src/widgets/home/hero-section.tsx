import Link from "next/link";
import { Badge, Button, Card } from "@gold/ui";

export function HeroSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <Card className="overflow-hidden bg-stone-950 p-8 text-white">
        <Badge className="bg-amber-400 text-stone-950">فروش امن و شفاف</Badge>
        <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          فروشگاه طلا با معماری قابل توسعه، قیمت‌گذاری شفاف و تجربه خرید امن
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
          این اسکلت پروژه برای رشد سریع فیچرها طراحی شده: کاتالوگ، حساب کاربری،
          سفارش، موجودی، محتوا و بعدا پنل ادمین و قیمت لحظه‌ای.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products/royal-ring">
            <Button>مشاهده محصولات</Button>
          </Link>
          <Link href="/blog">
            <Button variant="secondary" className="bg-white text-stone-950 hover:bg-stone-100">
              مطالب آموزشی
            </Button>
          </Link>
        </div>
      </Card>
      <Card className="p-8">
        <p className="text-sm font-medium text-stone-500">چرا این ساختار مناسب است؟</p>
        <ul className="mt-4 space-y-4 text-sm leading-7 text-stone-700">
          <li>فرانت feature-based برای توسعه مستقل هر دامنه</li>
          <li>بک‌اند Nest ماژولار با repository و DTO و service مجزا</li>
          <li>پستگرس + Prisma + Docker برای توسعه تیمی و استقرار استاندارد</li>
          <li>بیس امنیتی مناسب برای پروژه حساس فروش طلا</li>
        </ul>
      </Card>
    </section>
  );
}

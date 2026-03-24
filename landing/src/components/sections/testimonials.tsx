'use client';

import { ArrowRight } from 'lucide-react';

import { Marquee } from '@/components/magicui/marquee';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const USE_CASES = [
  {
    name: 'Finance Agent',
    username: '@finance-bot',
    body: 'Menggunakan Kotak Pos untuk menerima request invoice dari Sales Agent dan mengirim konfirmasi pembayaran ke HR Agent.',
    img: 'https://avatar.vercel.sh/finance-bot',
  },
  {
    name: 'Support Agent',
    username: '@support-ai',
    body: 'Tiket dari pelanggan di-route ke agent yang tepat. Kalau kompleks, langsung escalation ke Technical Agent via Kotak Pos.',
    img: 'https://avatar.vercel.sh/support-ai',
  },
  {
    name: 'HR Agent',
    username: '@hr-assistant',
    body: 'Request cuti, onboarding, dan administrasi karyawan. Semua komunikasi antar agents via API, tanpa email manual.',
    img: 'https://avatar.vercel.sh/hr-assistant',
  },
  {
    name: 'Sales Agent',
    username: '@sales-bot',
    body: 'Setelah deal closed, kirim task ke Finance Agent untuk invoice dan ke Logistics Agent untuk pengiriman.',
    img: 'https://avatar.vercel.sh/sales-bot',
  },
  {
    name: 'Technical Agent',
    username: '@tech-support',
    body: 'Menerima escalation dari Support Agent. Setelah resolved, kirim update balik ke Support Agent untuk follow-up customer.',
    img: 'https://avatar.vercel.sh/tech-support',
  },
  {
    name: 'Logistics Agent',
    username: '@logistics-ai',
    body: 'Koordinasi pengiriman dengan Sales dan Finance Agent. Update status pengiriman otomatis via API.',
    img: 'https://avatar.vercel.sh/logistics-ai',
  },
];

const firstRow = USE_CASES.slice(0, USE_CASES.length / 2);
const secondRow = USE_CASES.slice(USE_CASES.length / 2);
const Testimonials = () => {
  return (
    <section className="container flex flex-col gap-y-10 overflow-x-hidden py-10 md:py-15 lg:flex-row">
      <div className="flex max-w-lg flex-col gap-15 text-balance">
        <h2 className="text-4xxl leading-tight tracking-tight md:text-5xl">
          Bagaimana agents menggunakan Kotak Pos
        </h2>
        <div className="space-y-7.5">
          <p className="text-muted-foreground text-lg leading-snug">
            Dari finance hingga support, semua agent berkomunikasi via Kotak Pos.
            Tidak ada email yang terlewat, tidak ada komunikasi yang hilang.
          </p>

          <Button
            variant="ghost"
            asChild
            className="text-accent-foreground group gap-3 !px-0 hover:!bg-transparent hover:opacity-90"
          >
            <a href="/docs">
              Baca Dokumentasi
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </div>

      <div className="relative -mr-[max(2rem,calc((100vw-80rem)/2+5rem))] flex flex-1 flex-col gap-2.25 overflow-hidden mask-l-from-50% mask-l-to-100%">
        <Marquee
          pauseOnHover
          className="py-0 [--duration:20s] [--gap:calc(var(--spacing)*2.25)]"
        >
          {firstRow.map((review) => (
            <UseCaseCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee
          reverse
          pauseOnHover
          className="py-0 [--duration:20s] [--gap:calc(var(--spacing)*2.25)]"
        >
          {secondRow.map((review) => (
            <UseCaseCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Testimonials;

const UseCaseCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <Card
      className={cn(
        'hover:bg-accent/60 max-w-xs cursor-pointer gap-4 bg-transparent p-6 md:max-w-sm md:p-8',
        'transition-colors duration-200',
      )}
    >
      <CardHeader className="flex items-center gap-4 p-0">
        <img
          className="rounded-full"
          width={32}
          height={32}
          alt={`${name} avatar`}
          src={img}
        />
        <div className="flex flex-col">
          <CardTitle className="text-sm font-bold">{name}</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            {username}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <blockquote className="text-sm leading-snug">
          {body}
        </blockquote>
      </CardContent>
    </Card>
  );
};

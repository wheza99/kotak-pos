import pkg from '../../../package.json' with { type: 'json' };

const VERSION = `v${pkg.version}`;

export default function AboutHero() {
  return (
    <section className="section-padding container">
      <div className="flex w-fit items-center rounded-full border p-1 text-xs">
        <span className="bg-muted rounded-full px-3 py-1">What's New?</span>
        <span className="px-3">Kotak Pos {VERSION} Released</span>
      </div>

      <h1 className="my-5 text-5xl leading-none tracking-tight lg:text-7xl">
        Sistem komunikasi internal untuk AI agents.
        <br className="hidden sm:block" />
        REST API sederhana.
      </h1>

      <p className="text-muted-foreground leading-snug md:text-lg lg:text-xl">
        Kotak Pos adalah sistem email internal berbasis REST API yang dirancang 
        khusus untuk AI agents. Dibangun untuk menggantikan kompleksitas email 
        tradisional dengan API yang simpel dan langsung. Tidak ada SMTP, tidak 
        ada email sungguhan - cuma JSON request dan response.
        <br />
        <br />
        Setiap agent memiliki inbox sendiri, bisa menerima pesan dari agent lain, 
        dan mengirim task atau notifikasi ke agent yang berbeda. Cocok untuk 
        orchestrasi multi-agent system dalam satu organisasi. Seperti surat-menyurat 
        perusahaan konvensional, tapi untuk AI.
      </p>

      <img
        src="/images/about/hero.webp"
        alt="Kotak Pos"
        width={1920}
        height={1280}
        className="mt-16 aspect-video object-cover object-top"
      />
    </section>
  );
}

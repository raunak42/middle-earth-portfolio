"use client";

type ContactIconName = "github" | "email" | "phone" | "linkedin";

const CONTACT_LINKS: {
  icon: ContactIconName;
  label: string;
  value: string;
  href?: string;
}[] = [
  {
    icon: "github",
    label: "GitHub",
    value: "github.com/raunak42",
    href: "https://github.com/raunak42",
  },
  {
    icon: "email",
    label: "Email",
    value: "raunaklanjewar42@gmail.com",
    href: "mailto:raunaklanjewar42@gmail.com",
  },
  {
    icon: "phone",
    label: "Phone",
    value: "+91 9579974262",
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/raunak42",
    href: "https://www.linkedin.com/in/raunak42/",
  },
];

function ContactIcon({ icon }: { icon: ContactIconName }) {
  if (icon === "github") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.6 2 12.26c0 4.53 2.86 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.02-1.9-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.07 1.53 1.07.9 1.56 2.35 1.1 2.92.84.09-.67.35-1.1.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.96c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.36-.02 2.46-.02 2.8 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.26C22 6.6 17.52 2 12 2Z" />
      </svg>
    );
  }

  if (icon === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0Z" />
      </svg>
    );
  }

  if (icon === "email") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.1"
        aria-hidden="true"
      >
        <path d="M5.6 13.7 16 7.15l10.6 6.58v12.05c-7 .28-14.03.28-21.05 0L5.6 13.7Z" />
        <path d="M5.8 14.02 16.05 20.75 26.35 14" />
        <path d="M5.9 25.55c2.32-1.72 4.62-3.34 6.92-4.9" />
        <path d="M26.1 25.48c-2.28-1.67-4.6-3.28-6.92-4.84" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.35"
      aria-hidden="true"
    >
      <path d="M7.48 4.22c.9-.25 1.82-.2 2.78.12.46 1.5.6 2.82.4 3.92-.52.34-1.1.62-1.72.86.82 2.42 2.58 4.36 5.24 5.78.46-.5 1-.92 1.6-1.25 1.2.4 2.32 1.06 3.34 2 .16.88 0 1.76-.44 2.62-.86.72-1.9 1.1-3.12 1.12-4.86-1.18-8.62-4.92-10.88-10.74.48-1.84 1.42-3.32 2.8-4.43Z" />
      <path d="M7.82 5.22c-.34 1.08-.38 2.25-.08 3.52" />
      <path d="M15.36 16.02c1.1.52 2.22.7 3.38.54" />
    </svg>
  );
}

export default function ContactView() {
  return (
    <div className="h-full text-[#2a251f]">
      <div className="grid max-w-[620px] gap-5 md:gap-6">
        {CONTACT_LINKS.map((link) => {
          const content = (
            <>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#2f2a23]/55 p-2 text-[20px] font-black md:h-11 md:w-11 md:p-2.5 md:text-[24px] [&_svg]:h-full [&_svg]:w-full">
                <ContactIcon icon={link.icon} />
              </div>
              <div className="min-w-0">
                <h3 className="m-0 text-[clamp(17px,4.6vw,22px)] font-black leading-tight md:text-[clamp(17px,1.15vw,23px)]">
                  {link.label}
                </h3>
                <p className="m-0 mt-1 inline break-words border-b-2 border-[#4c9a47]/70 text-[clamp(13px,3.8vw,16px)] font-bold leading-tight md:text-[clamp(14px,0.95vw,18px)]">
                  {link.value}
                </p>
              </div>
            </>
          );

          if (!link.href) {
            return (
              <div key={link.label} className="flex items-center gap-4 md:gap-5">
                {content}
              </div>
            );
          }

          return (
            <a
              key={link.label}
              className="flex cursor-pointer items-center gap-4 text-current no-underline transition-transform hover:translate-x-1 md:gap-5 [&_*]:cursor-pointer"
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={`${link.label}: ${link.value}`}
            >
              {content}
            </a>
          );
        })}
      </div>

      <div className="mt-7 text-right text-[28px] text-[#4c9a47] md:mt-9 md:text-[32px]">
        ♡ ☻
      </div>
    </div>
  );
}

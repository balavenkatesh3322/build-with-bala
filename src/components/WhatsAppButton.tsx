import { whatsappLink } from "@/lib/site";

/** Floating chat icon. Opens a WhatsApp chat with Bala. */
export default function WhatsAppButton() {
  return (
    <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="wa" aria-label="Chat with Bala on WhatsApp">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <path fill="#fff" d="M16 3C8.8 3 3 8.6 3 15.6c0 2.5.7 4.8 2 6.8L3.6 28.5l6.3-1.6c1.9 1 4 1.6 6.1 1.6 7.2 0 13-5.6 13-12.6S23.2 3 16 3z" />
        <path fill="#25d366" d="M22.4 18.9c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.5 0-.6l-1.1-2.5c-.3-.7-.6-.6-.8-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.7 5 .8.4 1.4.6 1.9.7.8.2 1.5.2 2.1.1.6-.1 2-.8 2.2-1.6.3-.8.3-1.4.2-1.6 0-.1-.2-.2-.5-.4z" />
      </svg>
      <span className="wa-tip">Chat with Bala</span>
    </a>
  );
}

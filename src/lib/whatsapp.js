import { fmt } from './dates'

export const DEFAULT_TEMPLATE =
  'Hi {name}, your gym membership ends on {date}. Renew karein aur fitness jaari rakhein!'

export function fillTemplate(template, member) {
  return template.replaceAll('{name}', member.name.split(' ')[0]).replaceAll('{date}', fmt(member.endDate))
}

// Bina paid API ke: wa.me link khulta hai, message pehle se likha hua
export function waLink(phone, text) {
  return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`
}

export function openWhatsApp(phone, text) {
  window.open(waLink(phone, text), '_blank', 'noopener')
}

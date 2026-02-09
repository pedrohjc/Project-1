const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email: string): boolean {
  if (!email) return false
  return adminEmails.includes(email.trim().toLowerCase())
}

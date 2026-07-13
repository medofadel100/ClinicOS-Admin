export async function sendTransactionalEmail({ to, subject, body }: { to: string, subject: string, body: string }) {
  // TODO: Implement real Resend API integration here
  // For Checkpoint 9, we simulate sending unless Resend API keys are provided
  console.log(`[EMAIL SIMULATOR] Sending to: ${to}`);
  console.log(`[EMAIL SIMULATOR] Subject: ${subject}`);
  console.log(`[EMAIL SIMULATOR] Body: ${body}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate 5% random failure rate for testing independent recipient failures
  if (Math.random() < 0.05) {
    throw new Error("Simulated email bounce");
  }

  return { success: true };
}

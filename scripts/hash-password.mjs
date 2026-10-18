import bcrypt from "bcryptjs";
const password = process.argv[2];
if (!password) {
  console.error(
    "Usage: node scripts/hash-password.mjs 'a-long-unique-password'",
  );
  process.exit(1);
}
if (password.length < 16) {
  console.error("Use a password with at least 16 characters.");
  process.exit(1);
}
console.log(await bcrypt.hash(password, 12));

const bcrypt = require('bcryptjs')

async function main() {
  const password = 'upbjj@UT22'
  const hash = await bcrypt.hash(password, 10)
  
  console.log('🔐 NEW ADMIN PASSWORD UPDATE')
  console.log('==========================')
  console.log('Username: admin1')
  console.log('New Password:', password)
  console.log('Hash:', hash)
  console.log('')
  console.log('✅ Use this password to login: upbjj@UT22')
}

main()

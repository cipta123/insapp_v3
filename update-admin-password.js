// Simple password hash generator
const bcrypt = require('bcryptjs')

async function generateHash() {
  const password = 'upbjj@UT22'
  const hash = await bcrypt.hash(password, 10)
  
  console.log('Password:', password)
  console.log('Hash:', hash)
  console.log('')
  console.log('SQL Command to run in database:')
  console.log(`UPDATE SystemUser SET password = '${hash}' WHERE username = 'admin1';`)
}

generateHash()

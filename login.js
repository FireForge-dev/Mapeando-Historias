async function fazerLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })

  if (error) {
    console.error('Erro no login:', error.message)
    return alert('Credenciais inválidas!')
  }

  console.log('Login realizado com sucesso!', data)
  // Redirecionar o usuário para a página principal aqui
}
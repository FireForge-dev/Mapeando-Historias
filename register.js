async function registrarUsuario(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  })

  if (error) {
    console.error('Erro ao registrar:', error.message)
    return alert('Erro no registro: ' + error.message)
  }

  console.log('Usuário registrado:', data)
  alert('Verifique seu e-mail para confirmar o cadastro!')
}
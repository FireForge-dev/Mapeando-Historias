async function fazerLogout() {
  const { error } = await supabase.auth.signOut()
  if (!error) {
    alert('Você saiu do sistema.')
    // Redirecionar para a tela de login
  }
}
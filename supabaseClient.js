import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jgrbsfbttrcbtfdyzrnr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpncmJzZmJ0dHJjYnRmZHl6cm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzE1NDIsImV4cCI6MjA3ODY0NzU0Mn0.iUQvPg4n79mwiUPR0I4-VbV9S5vgVHe9F9JWnrrokpo'

export const supabase = createClient(supabaseUrl, supabaseKey)
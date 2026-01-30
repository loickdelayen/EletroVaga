import { createClient } from '@supabase/supabase-js'

// Substitua estas strings pelos dados que estão no painel do seu Supabase
// (Settings -> API -> Project URL / Anon Public Key)
const supabaseUrl = 'https://hbgbrombvxotnvfkedao.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ2Jyb21idnhvdG52ZmtlZGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTE1MzUsImV4cCI6MjA4NTI2NzUzNX0.A9huDK5JqwIcq4VrGKNU7P2RCjCusxGz3Xp6GTbsv6E'

export const supabase = createClient(supabaseUrl, supabaseKey)
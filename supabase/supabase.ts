import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://mpxwwjnxgjfznxhlymaq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weHd3am54Z2pmem54aGx5bWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MjcwMjYsImV4cCI6MjA2OTUwMzAyNn0.lTq5JFP7zZY9OhdeBK09km_6bPYKyjUQqqP5xov2GA4'
export const supabase = createClient(supabaseUrl, supabaseKey)
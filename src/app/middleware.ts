import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/tasks/:path*', '/api/goals/:path*']
}
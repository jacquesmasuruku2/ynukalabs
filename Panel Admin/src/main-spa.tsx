import React from 'react'
import ReactDOM from 'react-dom/client'
import { RootRoute, Router, Outlet } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles.css'

const rootRoute = new RootRoute({
  component: () => <Outlet />,
})

const router = new Router({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<router.RootComponent />)
}

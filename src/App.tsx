import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { routes } from '@/routes';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {routes.map((route) =>
          route.path === '/' ? (
            <Route key={route.path} index element={route.element} />
          ) : (
            <Route key={route.path} path={route.path.replace('/', '')} element={route.element} />
          ),
        )}
      </Route>
    </Routes>
  );
}

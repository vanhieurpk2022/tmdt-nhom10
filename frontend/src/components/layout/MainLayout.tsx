import { Outlet } from 'react-router';
import { Header } from './Header';
import Footer from './Footer';
import { Chatbot } from '../chatbot';

export default function MainLayout() {
  return <><Header /><Outlet /><Footer /><Chatbot /></>;
}

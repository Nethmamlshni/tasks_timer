//create nav bar
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-pink-300 p-6 text-white mx-auto flex justify-center">
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="hover:underline">
           Welcome to Task Manager & Timer App
          </Link>
        </li>
        
      </ul>
    </nav>
  );
}
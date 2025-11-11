//create footer page 
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-pink-300  text-white p-6">
            <div className="container mx-auto flex justify-center space-x-4">
                <Link href="#" className="hover:underline">
                    Privacy Policy
                </Link>
                <Link href="#" className="hover:underline">
                    Terms of Service
                </Link>
                <Link href="#" className="hover:underline">
                    Contact Us
                </Link>
            </div>
        </footer>
    );
}
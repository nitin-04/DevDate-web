
const Footer = () => {
    return (

        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                {/* Your page content goes here */}
            </main>

            <footer className="footer bg-base-300 text-base-content p-7">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All rights reserved by ACME Industries Ltd</p>
                </aside>
            </footer>
        </div>

    )
}

export default Footer

import { Button, Link } from "@heroui/react";

export default function Error404() {
  return (
    <div className="py-10 m-0 lg:ml-72">
      <main className="px-4 sm:px-6 lg:px-8">
        <section className="flex items-center h-full p-16">
          <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
            <div className="max-w-md text-center">
              <h2 className="mb-8 font-extrabold text-9xl dark:text-gray-400">
                <span className="sr-only">Errore</span>404
              </h2>
              <p className="text-2xl font-semibold md:text-3xl">
                Siamo spiacenti, non siamo riusciti a trovare questa pagina.
              </p>
              <p className="mt-4 mb-8 dark:text-gray-600">
                Ma non preoccuparti, puoi trovare molte altre cose sulla nostra
                dashboard.
              </p>
              <Button as={Link} href="/" color="primary" radius="sm" size="lg">
                Torna alla homepage
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

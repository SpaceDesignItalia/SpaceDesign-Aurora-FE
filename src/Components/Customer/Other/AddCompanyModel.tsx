import { Input, Button } from "@nextui-org/react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveIcon from "@mui/icons-material/Save";

export default function AddCompanyModel() {
  return (
    <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
      <form action="#" method="POST">
        <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Azienda
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai aggiungere una nuova azienda al
                database.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome azienda
                </label>
                <Input variant="bordered" type="email" radius="sm" fullWidth />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Indirizzo
                </label>
                <Input variant="bordered" type="text" radius="sm" fullWidth />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email azienda
                </label>
                <Input variant="bordered" type="email" radius="sm" fullWidth />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Numero di telefono
                </label>
                <Input variant="bordered" type="number" radius="sm" fullWidth />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button
              color="success"
              className="text-white"
              radius="sm"
              startContent={<SaveIcon />}
            >
              Salva azienda
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

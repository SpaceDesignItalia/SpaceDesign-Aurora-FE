import {
  Input,
  Autocomplete,
  AutocompleteItem,
  Button,
} from "@nextui-org/react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveIcon from "@mui/icons-material/Save";

export default function AddCustomerModel() {
  const company = [
    {
      compnayId: 1,
      companyName: "Syllog S.r.l",
      companyAddress: "Viale Della Repubblica, PO",
      companyEmail: "info@syllog.ai",
    },
    {
      compnayId: 2,
      companyName: "Globalcom S.r.l",
      companyAddress: "Via Benedetto Croce, 118, 91028 Partanna TP",
      companyEmail: "info@globalcomonline.it",
    },
  ];
  return (
    <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
      <form action="#" method="POST">
        <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Cliente
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai aggiungere un nuovo cliente al
                database.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome
                </label>
                <Input variant="bordered" type="text" radius="sm" />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Cognome
                </label>
                <Input variant="bordered" type="text" radius="sm" />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email
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

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Azienda
                </label>
                <div className="flex flex-row gap-4">
                  <Autocomplete
                    defaultItems={company}
                    placeholder="Seleziona azienda"
                    variant="bordered"
                    radius="sm"
                    fullWidth
                  >
                    {(company) => (
                      <AutocompleteItem
                        key={company.compnayId}
                        textValue={company.companyName}
                      >
                        {" "}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            <div className="flex flex-col">
                              <span className="text-small">
                                {company.companyName}
                              </span>
                              <span className="text-tiny text-default-400">
                                {company.companyAddress}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                  <Button
                    color="primary"
                    radius="sm"
                    startContent={<AddRoundedIcon />}
                  >
                    Aggiungi azienda
                  </Button>
                </div>
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
              Salva cliente
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

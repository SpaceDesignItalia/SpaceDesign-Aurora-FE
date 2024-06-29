import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ViewCompanyModal({ isOpen, isClosed, CompanyData }) {
  const [companyMembers, setCompanyMembers] = useState([]);

  useEffect(() => {
    axios
      .get("/Company/GET/GetCompanyMembersById", {
        params: { CompanyId: CompanyData.CompanyId },
      })
      .then((res) => {
        setCompanyMembers(res.data);
      });
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="5xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Anteprima {CompanyData.CompanyName}
            </ModalHeader>
            <ModalBody>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Nome azienda
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {CompanyData.CompanyName}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Indirizzo azienda
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {CompanyData.CompanyAddress}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Email azienda
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {CompanyData.CompanyEmail}
                    </dd>
                  </div>
                  {CompanyData.CompanyPhone !== null && (
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Telefono azienda
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {CompanyData.CompanyPhone}
                      </dd>
                    </div>
                  )}
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Clienti associati
                    </dt>
                    <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {companyMembers.length === 0 ? (
                        <p>Nessun membro trovato</p>
                      ) : (
                        <Accordion variant="bordered" isCompact>
                          {companyMembers.map((member) => (
                            <AccordionItem
                              key="1"
                              aria-label={member.customerfullname}
                              title={member.customerfullname}
                            >
                              <div class="border-t border-gray-100">
                                <dl class="divide-y divide-gray-100">
                                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">
                                      Nome Cliente
                                    </dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                      {member.customerfullname}
                                    </dd>
                                  </div>
                                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">
                                      Email Cliente
                                    </dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                      {member.CustomerEmail}
                                    </dd>
                                  </div>
                                  {member.CustomerPhone !== null && (
                                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                      <dt class="text-sm font-medium leading-6 text-gray-900">
                                        Telefono Cliente
                                      </dt>
                                      <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        {member.CustomerPhone}
                                      </dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onClick={isClosed}
                radius="sm"
              >
                Chiudi
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

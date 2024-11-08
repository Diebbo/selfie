"use client";

import React, { useState, useRef } from 'react';
import { Tabs, Tab, Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow } from "@nextui-org/react";
import { SelfieEvent } from "@/helpers/types";
import { saveAs } from 'file-saver';
import ical, { ICalEventStatus, ICalEventTransparency } from 'ical-generator';

interface ImportExportCalProps {
  events: SelfieEvent[] | null;
};

const ImportExportCal: React.FC<ImportExportCalProps> = ({ events }) => {
  const [importUrl, setImportUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    body: React.ReactNode;
  }>({ body: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showModal = (body: React.ReactNode) => {
    setModalContent({ body });
    setIsModalOpen(true);
  };

  const renderEventsList = (titles: string[]) => (
    <ScrollShadow className="max-h-[60vh]">
      <div className="text-success font-bold mb-4 border-2 border-black rounded-[20px] p-6">
        The import has done succeffully
        {(titles.length > 1
        ) ? (
          <p className=" text-lg text-black dark:text-white font-semibold mb-4">
            {titles.length} files have been imported:
          </p>
        ) : (
          <p className=" text-lg text-black dark:text-white font-semibold mb-4">
            {titles.length} file has been imported:
          </p>
        )}
        <ul className="space-y-2">
          {titles.map((title: string, index: number) => (
            <li key={index} className="border-2 border-default-300 text-default-800 font-medium rounded-[30px] p-2 px-4" >
              {index + 1}. {title}
            </li>
          ))}
        </ul>
      </div>
    </ScrollShadow>
  );

  const exportToIcal = () => {
    if (!events || events.length === 0) {
      setError('No events to export');
      return;
    }

    const calendar = ical({ name: 'My Calendar' });

    events.forEach(event => {
      const icalEvent = calendar.createEvent({
        start: new Date(event.dtstart),
        end: new Date(event.dtend),
        summary: event.title.toString(),
        description: event.description.toString(),
        location: event.location.toString(),
        url: event.URL.toString(),
        status: event.status.toString() as ICalEventStatus,
        transparency: event.transp as ICalEventTransparency,
        allDay: Boolean(event.allDay),
      });

      if (event.geo && typeof event.geo.lat === 'number' && typeof event.geo.lon === 'number') {
        icalEvent.location({
          title: event.location.toString(),
          geo: {
            lat: event.geo.lat,
            lon: event.geo.lon
          }
        });
      }
    });

    const icalString = calendar.toString();
    const blob = new Blob([icalString], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, 'my-calendar.ics');

    showModal(
      <div className="p-3 mb-2 pb-5">
        <h1 className='font-bold pb-3 text-success'>The export has been done succeffully </h1>
        <span className=" text-default-800 text-sm mt-2">The file my-calendar.ics has been created</span>
      </div>
    );
  };

  const importFromUrl = async () => {
    if (!importUrl) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/events/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: importUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to import calendar');
      }

      const importedTitles = Object(await response.json()).importedTitles;
      showModal(
        renderEventsList(importedTitles)
      );

      setImportUrl('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import calendar');
    } finally {
      setLoading(false);
    }
  };

  const browseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError("File not founded");
      return;
    }
    setFile(file);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const icalData = event.target?.result;
        if (typeof icalData !== 'string') return;

        const response = await fetch('/api/events/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ icalData }),
        });

        if (!response.ok) {
          throw new Error('Failed to import calendar');
        }

        const importedTitles = Object(await response.json()).importedTitles;
        console.log("components ", importedTitles);

        showModal(
          renderEventsList(importedTitles)
        );

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFile(undefined);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to import calendar');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full mb-4">
      <Tabs aria-label="Calendar Options">
        <Tab key="export" title="Export">
          <div className="mt-2">
            <Button
              color="primary"
              onClick={exportToIcal}
              className="w-full"
            >
              Export Calendar (.ics)
            </Button>
          </div>
        </Tab>
        <Tab key="import" title="Import">
          <div className="mt-4 space-y-4">
            <Input
              type="url"
              label="Import from URL"
              labelPlacement='outside'
              placeholder="Enter iCal URL"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              className="w-full"
            />
            <Button
              color="primary"
              onClick={importFromUrl}
              isLoading={loading}
              className="w-full"
            >
              from URL
            </Button>
            <div className="text-center">
              or
            </div>
            <Input
              type="file"
              label="Search your file"
              accept=".ics,.ical"
              onChange={browseFile}
              ref={fileInputRef}
              className="w-full"
            />
            <Button
              color="primary"
              onClick={handleFileUpload}
              className="w-full"
            >
              from File (.ics .ical)
            </Button>
          </div>
        </Tab>
      </Tabs>

      {error && (
        <div className="mt-4 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        scrollBehavior="inside"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
          </ModalHeader>
          <ModalBody>
            {modalContent.body}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ImportExportCal;

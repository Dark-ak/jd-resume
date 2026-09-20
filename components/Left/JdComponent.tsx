"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFileStore } from "@/store/fileStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";

export default function JdComponent() {
  const { setFile } = useFileStore();

  return (
    <div className="h-fit lg:h-screen col-span-2 p-4 overflow-y-auto">
      <div>
        <h2 className="font-bold">JD-Resume</h2>

        <div className="px-3 py-6 flex flex-col gap-8">
          <div>
            <p className="text-primary font-semibold">Upload Resume</p>
            <Field>
              <Input
                onChange={(e) => {
                  return setFile(e.target.files);
                }}
                className="max-w-75"
                id="resume"
                type="file"
              />
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-primary font-semibold">Job Description</p>
            <Field>
              <FieldDescription>Enter Job Description.</FieldDescription>
              <Textarea
                id="textarea-message"
                className="max-h-125"
                placeholder="Type your message here."
              />
            </Field>

            <Button>Generate</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

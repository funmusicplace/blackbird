import React from "react";
import Button from "../common/Button";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { parseBlob } from "music-metadata-browser";
import api from "services/api";
import { InputEl } from "../common/Input";
import FormComponent from "components/common/FormComponent";
import { useSnackbar } from "state/SnackbarContext";
import { useGlobalStateContext } from "state/GlobalState";
import Table from "components/common/Table";
import { useTranslation } from "react-i18next";
import { css } from "@emotion/css";
import { BulkTrackUploadRow } from "./BulkTrackUploadRow";
import Tooltip from "components/common/Tooltip";
import { FaQuestionCircle } from "react-icons/fa";
import useJobStatusCheck from "utils/useJobStatusCheck";

import { Buffer } from "buffer";
import process from "process";
import { IAudioMetadata, ICommonTagsResult } from "music-metadata/lib/type";
import { pickBy } from "lodash";

if (typeof window !== "undefined" && typeof window.Buffer === "undefined") {
  window.Buffer = Buffer;
}

if (typeof window !== "undefined" && typeof window.process === "undefined") {
  window.process = process;
}

export interface ShareableTrackgroup {
  creatorId: number;
  slug: string;
}

export interface TrackData {
  duration?: number;
  file: File;
  title: string;
  status: Track["status"];
  order: string;
  metadata: { [key: string]: any };
  trackArtists: {
    artistName?: string;
    artistId?: number;
    role?: string;
    isCoAuthor?: boolean;
  }[];
}

interface FormData {
  trackFiles: FileList;
  tracks: TrackData[];
}

const fileListIntoArray = (fileList: FileList) => {
  if (fileList?.length > 0) {
    const files = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      if (file) {
        files.push(file);
      }
    }
    return files;
  }

  return [];
};

const parse = async (
  files: File[]
): Promise<
  {
    file: File;
    metadata: IAudioMetadata;
  }[]
> => {
  const parsed = await Promise.all(
    files.map(async (file) => {
      try {
        const parsedFile = await parseBlob(file);
        const metadata = parsedFile.common;
        return {
          file,
          metadata: {
            ...parsedFile,
            common: {
              title: metadata.title ?? file.name,
              ...parsedFile.common,
            },
          },
        };
      } catch (e) {
        console.error("Error parsing metadata", e);
        return {
          file,
          metadata: {
            common: {
              title: file.name,
            } as ICommonTagsResult,
          } as IAudioMetadata,
        };
      }
    })
  );
  return parsed;
};

export const BulkTrackUpload: React.FC<{
  trackgroup: TrackGroup;
  reload: () => Promise<void>;
}> = ({ trackgroup, reload }) => {
  const { t } = useTranslation("translation", { keyPrefix: "manageAlbum" });
  const methods = useForm<FormData>();
  const { register, handleSubmit, watch, control, reset } = methods;
  const { uploadJobs, setUploadJobs } = useJobStatusCheck({ reload, reset });
  const { fields, replace, remove } = useFieldArray({
    control,
    name: "tracks",
  });
  const [isProcessing, setIsProcessing] = React.useState(false);

  const {
    state: { user },
  } = useGlobalStateContext();

  const trackFiles = watch("trackFiles");

  const [isSaving, setIsSaving] = React.useState(false);
  const snackbar = useSnackbar();

  const userId = user?.id;

  const uploadNextTrack = React.useCallback(
    async (remainingTracks: { order: number; t: TrackData }[]) => {
      const firstTrack = remainingTracks.pop();
      if (firstTrack) {
        const packet = {
          title: firstTrack.t.title,
          metadata: pickBy(firstTrack.t.metadata, [
            "format",
            "common",
            "native",
          ]),
          artistId: trackgroup.artistId,
          isPreview: firstTrack.t.status === "preview",
          order: firstTrack.order,
          trackGroupId: trackgroup.id,
          trackArtists: firstTrack.t.trackArtists.map((a) => ({
            ...a,
            artistId:
              a.artistId && isFinite(+a.artistId) ? +a.artistId : undefined,
          })),
        };

        const result = await api.post<Partial<Track>, { track: Track }>(
          `users/${userId}/tracks`,
          packet
        );
        const jobInfo = await api.uploadFile(
          `users/${userId}/tracks/${result.track.id}/audio`,
          [firstTrack.t.file]
        );

        const jobId = jobInfo.result.jobId;

        setUploadJobs((existingJobs) => [
          ...(existingJobs ?? []),
          { jobId, jobStatus: "waiting" },
        ]);

        setTimeout(async () => {
          await uploadNextTrack(remainingTracks);
        }, 30000);
      } else {
        setIsSaving(false);

        snackbar(t("doneUploading"), {
          type: "success",
          timeout: 10000,
          position: "center",
        });
      }
    },
    [setUploadJobs, trackgroup.artistId, trackgroup.id, userId, snackbar, t]
  );

  const doAddTrack = React.useCallback(
    async (data: FormData) => {
      try {
        if (userId) {
          setIsSaving(true);
          snackbar(t("uploadingTracks"), {
            type: "success",
            timeout: 10000,
            position: "center",
          });

          await uploadNextTrack(
            data.tracks.map((t, i) => ({
              order: Number.isFinite(+t.order) ? Number(t.order) : i + 1,
              t,
            }))
          );
        }
      } catch (e) {
        console.error(e);
        snackbar("There was a problem with the API", {
          type: "warning",
        });
      }
    },
    [userId, uploadNextTrack, t, snackbar]
  );

  const processUploadedFiles = React.useCallback(
    (filesToProcess: FileList) => {
      setIsProcessing(true);
      const filesToParse = fileListIntoArray(filesToProcess);
      (async () => {
        const parsed = await parse(filesToParse);

        replace(
          parsed
            .sort((a, b) =>
              (a.metadata.common.track.no ?? 0) >
              (b.metadata.common.track.no ?? 0)
                ? 1
                : -1
            )
            .map((p, i) => ({
              metadata: p.metadata,
              order: `${
                p.metadata.common.track.no &&
                Number.isFinite(+p.metadata.common.track.no)
                  ? Number(p.metadata.common.track.no)
                  : i + 1
              }`,
              duration: p.metadata.format.duration,
              file: p.file,
              title: p.metadata.common.title ?? "",
              status: "preview",
              trackArtists:
                p.metadata.common.artists?.map((artist) => ({
                  artistName: artist ?? "",
                  role: "",
                  isCoAuthor: true,
                  artistId:
                    artist === trackgroup.artist?.name
                      ? trackgroup.artistId
                      : undefined,
                })) ?? [],
            }))
        );
        setIsProcessing(false);
      })();
    },
    [replace, trackgroup.artist?.name, trackgroup.artistId]
  );

  React.useEffect(() => {
    processUploadedFiles(trackFiles);
  }, [processUploadedFiles, trackFiles]);

  const disableUploadButton = isSaving || uploadJobs.length > 0;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(doAddTrack)}
        className={css`
          margin-top: 1rem;
        `}
      >
        <h4>{t("uploadTracks")}</h4>
        <p>{t("uploadTracksDescription")}</p>
        <FormComponent>
          <label
            htmlFor="audio"
            className={css`
              position: relative;
              display: flex;
              gap: 10px;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 200px;
              padding: 20px;
              border-radius: 10px;
              border: 2px dashed #555;
              width: 100%;
              color: #444;
              cursor: pointer;
              transition: background 0.2s ease-in-out, border 0.2s ease-in-out;
            `}
          >
            <div>{t("dropFilesHere")}</div>
            {t("or")}
            <InputEl
              type="file"
              id="audio"
              disabled={disableUploadButton}
              multiple
              {...register("trackFiles")}
              accept="audio/flac,audio/wav,audio/x-flac,audio/aac,audio/aiff,audio/x-m4a"
            />
          </label>
        </FormComponent>
        {fields.length > 0 && (
          <>
            <p>{t("addTheFollowingTracks")}</p>
            <Table
              className={css`
                font-size: 14px;
                margin: 1rem 0;
                input {
                  margin-bottom: 0;
                  font-size: 14px;
                }

                button {
                  font-size: 14px;
                }

                select {
                  font-size: 14px;
                }
              `}
            >
              <thead>
                <tr>
                  <th
                    className={css`
                      min-width: 50px;
                    `}
                  ></th>
                  <th
                    className={css`
                      min-width: 200px;
                    `}
                  >
                    {t("trackTitle")}{" "}
                    <Tooltip hoverText={t("trackTitleHelp")}>
                      <FaQuestionCircle />
                    </Tooltip>
                  </th>
                  <th>
                    {t("artists")}{" "}
                    <Tooltip hoverText={t("trackArtistsHelp")}>
                      <FaQuestionCircle />
                    </Tooltip>
                  </th>
                  <th className="alignRight">{t("duration")}</th>
                  <th>
                    {t("status")}{" "}
                    <Tooltip hoverText={t("statusHelp")}>
                      <FaQuestionCircle />
                    </Tooltip>
                  </th>
                  <th className="alignRight">{t("metadata")}</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((t, idx) => (
                  <BulkTrackUploadRow
                    track={t}
                    key={t.title}
                    index={idx}
                    uploadingState={uploadJobs?.[idx]?.jobStatus}
                    isSaving={isSaving}
                    remove={remove}
                  />
                ))}
              </tbody>
            </Table>
            {fields.length > 0 && (
              <Button
                type="submit"
                disabled={disableUploadButton}
                isLoading={disableUploadButton || isProcessing}
              >
                {t("uploadTracks")}
              </Button>
            )}
          </>
        )}
      </form>
    </FormProvider>
  );
};

export default BulkTrackUpload;

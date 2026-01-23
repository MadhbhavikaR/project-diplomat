/**
 * Artifact Tab Component
 * 
 * A component for displaying and managing artifacts with version control.
 * This component handles different media types (images, audio, text) and provides
 * functionality for viewing, downloading, and switching between artifact versions.
 */

import React, { useState, useEffect } from 'react';
import './ArtifactTabComponent.css';

// Define TypeScript interfaces
interface Artifact {
  id: string;
  versionId: number;
  data: string;
  mimeType: string;
  mediaType: string;
}

// MediaType as string constants to comply with TypeScript configuration
const MediaType = {
  IMAGE: 'image',
  AUDIO: 'audio',
  TEXT: 'text',
  UNSPECIFIED: 'unspecified',
} as const;

type MediaType = typeof MediaType[keyof typeof MediaType];

// Type guard for MediaType
function isMediaType(value: string): value is MediaType {
  return Object.values(MediaType).includes(value as MediaType);
}

interface ArtifactTabComponentProps {
  artifacts: Artifact[];
}

// Utility functions
const DEFAULT_ARTIFACT_NAME = 'default_artifact_name';

function getMediaTypeFromMimetype(mimetype: string): MediaType {
  const lowerMime = mimetype.toLowerCase();

  for (const enumValue of Object.values(MediaType)) {
    if (enumValue === MediaType.UNSPECIFIED) {
      continue;
    }

    if (lowerMime.startsWith(enumValue + '/')) {
      return enumValue as MediaType;
    }
  }

  return MediaType.UNSPECIFIED;
}

function isArtifactImage(mimeType: string): boolean {
  if (!mimeType) {
    return false;
  }
  return mimeType.startsWith('image/');
}

function isArtifactAudio(mimeType: string): boolean {
  if (!mimeType) {
    return false;
  }
  return mimeType.startsWith('audio/');
}

const ArtifactTabComponent: React.FC<ArtifactTabComponentProps> = ({ artifacts }) => {
  const [selectedArtifacts, setSelectedArtifacts] = useState<Artifact[]>([]);

  // Initialize selected artifacts when artifacts change
  useEffect(() => {
    const distinctArtifactIds = getDistinctArtifactIds();
    const newSelectedArtifacts: Artifact[] = [];

    for (const artifactId of distinctArtifactIds) {
      const sortedArtifacts = getSortedArtifactsFromId(artifactId);
      if (sortedArtifacts.length > 0) {
        newSelectedArtifacts.push(sortedArtifacts[0]);
      }
    }

    setSelectedArtifacts(newSelectedArtifacts);
  }, [artifacts]);

  const getDistinctArtifactIds = (): string[] => {
    return [...new Set(artifacts.map((artifact) => artifact.id))];
  };

  const getSortedArtifactsFromId = (artifactId: string): Artifact[] => {
    return artifacts
      .filter((artifact) => artifact.id === artifactId)
      .sort((a, b) => b.versionId - a.versionId);
  };

  const getArtifactName = (artifactId: string): string => {
    return artifactId ?? DEFAULT_ARTIFACT_NAME;
  };

  const onArtifactVersionChange = (artifactId: string, versionId: number) => {
    const sortedArtifacts = getSortedArtifactsFromId(artifactId);
    const selectedArtifact = sortedArtifacts.find(a => a.versionId === versionId);

    if (selectedArtifact) {
      setSelectedArtifacts(prev => 
        prev.map(art => 
          art.id === artifactId ? selectedArtifact : art
        )
      );
    }
  };

  const downloadArtifact = (artifact: Artifact) => {
    // Implement download functionality
    console.log('Download artifact:', artifact.id);
    // This would use a download service in a real implementation
  };

  const openArtifact = (data: string, mimeType: string) => {
    if (isArtifactImage(mimeType)) {
      openViewImageDialog(data);
      return;
    }

    openBase64InNewTab(data, mimeType);
  };

  const openViewImageDialog = (fullBase64DataUrl: string) => {
    if (!fullBase64DataUrl || !fullBase64DataUrl.startsWith('data:') ||
        fullBase64DataUrl.indexOf(';base64,') === -1) {
      return;
    }

    // In a real implementation, this would open a dialog
    console.log('Open image dialog:', fullBase64DataUrl);
    // This would use a dialog service to open ViewImageDialogComponent
  };

  const openBase64InNewTab = (dataUrl: string, mimeType: string) => {
    // Implement opening in new tab
    console.log('Open in new tab:', mimeType);
    // This would create a blob URL and open it in a new tab
  };

  const distinctArtifactIds = getDistinctArtifactIds();

  return (
    <div className="artifact-container">
      {distinctArtifactIds.length === 0 ? (
        <div className="no-artifacts-message">
          No artifacts available
        </div>
      ) : (
        distinctArtifactIds.map((artifactId, index) => {
          const selectedArtifact = selectedArtifacts.find(art => art.id === artifactId);
          const sortedArtifacts = getSortedArtifactsFromId(artifactId);

          if (!selectedArtifact) return null;

          return (
            <div key={artifactId} className="artifact-box">
              {index > 0 && <hr className="white-separator" />}

              <div className="artifact-metadata">
                <button
                  className="link-style-button"
                  onClick={() => openArtifact(selectedArtifact.data, selectedArtifact.mimeType)}
                >
                  {getArtifactName(artifactId)}
                </button>
              </div>

              <div className="artifact-metadata">
                <span>Version: </span>
                <div className="version-select-container">
                  <select
                    value={selectedArtifact.versionId}
                    onChange={(e) => onArtifactVersionChange(artifactId, Number(e.target.value))}
                    className="version-select"
                  >
                    {sortedArtifacts.map((artifact) => (
                      <option key={artifact.versionId} value={artifact.versionId}>
                        {artifact.versionId}
                      </option>
                    ))}
                  </select>

                  <button
                    className="download-button"
                    onClick={() => downloadArtifact(selectedArtifact)}
                  >
                    📥 Download
                  </button>
                </div>
              </div>

              <div className="artifact-content">
                {selectedArtifact.mediaType === MediaType.IMAGE && (
                  <div>
                    <img
                      className="generated-image"
                      src={selectedArtifact.data || ''}
                      alt={artifactId}
                      onClick={() => openViewImageDialog(selectedArtifact.data)}
                    />
                  </div>
                )}

                {selectedArtifact.mediaType === MediaType.AUDIO && (
                  <div>
                    {/* In a real implementation, this would use an AudioPlayerComponent */}
                    <audio controls className="audio-player">
                      <source src={selectedArtifact.data} type={selectedArtifact.mimeType} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ArtifactTabComponent;

export { MediaType, getMediaTypeFromMimetype, isArtifactImage, isArtifactAudio };
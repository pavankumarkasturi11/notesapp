import { useState, useEffect, type FormEvent } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl, uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

// Import the generated schema type from your Amplify backend
import type { Schema } from "../amplify/data/resource";

// Configure Amplify using your outputs
Amplify.configure(outputs);

// Create the data client with correct type
const client = generateClient<Schema>({
  authMode: "userPool",
});

interface Note {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const { data: notesData } = await client.models.Note.list();

      const updatedNotes = await Promise.all(
        notesData.map(async (note) => {
          if (note.image) {
            const linkToStorageFile = await getUrl({
              path: ({ identityId }) => `media/${identityId}/${note.image}`,
            });
            note.image = linkToStorageFile.url.toString();
          }
          return note as Note;
        })
      );

      setNotes(updatedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const imageFile = form.get("image") as File | null;

    try {
      const { data: newNote } = await client.models.Note.create({
        name: form.get("name") as string,
        description: form.get("description") as string,
        image: imageFile?.name,
      });

      if (imageFile && newNote?.image) {
        await uploadData({
          path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
          data: imageFile,
        }).result;
      }

      fetchNotes();
      event.currentTarget.reset();
    } catch (error) {
      console.error("Error creating note:", error);
    }
  }

  async function deleteNote(note: Note) {
    try {
      const { data: deletedNote } = await client.models.Note.delete({
        id: note.id,
      });
      console.log("Deleted note:", deletedNote);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading level={1}>My Notes App</Heading>

          {/* Create Note Form */}
          <View as="form" margin="3rem 0" onSubmit={createNote}>
            <Flex
              direction="column"
              justifyContent="center"
              gap="2rem"
              padding="2rem"
            >
              <TextField
                name="name"
                placeholder="Note Name"
                label="Note Name"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="description"
                placeholder="Note Description"
                label="Note Description"
                labelHidden
                variation="quiet"
                required
              />
              <View
                name="image"
                as="input"
                type="file"
                alignSelf="end"
                accept="image/png, image/jpeg"
              />
              <Button type="submit" variation="primary">
                Create Note
              </Button>
            </Flex>
          </View>

          <Divider />
          <Heading level={2}>Current Notes</Heading>

          {/* Notes List */}
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
              >
                <Heading level={3}>{note.name}</Heading>
                <Text fontStyle="italic">{note.description}</Text>

                {note.image && (
                  <Image
                    src={note.image}
                    alt={`visual aid for ${note.name}`}
                    style={{ width: 400 }}
                  />
                )}

                <Button
                  variation="destructive"
                  onClick={() => deleteNote(note)}
                >
                  Delete note
                </Button>
              </Flex>
            ))}
          </Grid>

          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}

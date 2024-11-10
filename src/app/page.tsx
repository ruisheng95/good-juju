"use client";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { FixedSizeList } from "react-window";

interface ReactWindowRowProps {
  index: number;
  style?: React.CSSProperties;
  data: ReactWindowRowItemData;
}

interface ReactWindowRowItemData {
  logs: string[];
}

const ReactWindowRow = ({ data, style, index }: ReactWindowRowProps) => {
  return (
    <Box key={index} style={style}>
      {/* <ListItemButton
        selected={data.selectedIndex === index}
        onClick={() => {
          const params = new Proxy(
            new URLSearchParams(window.location.search),
            {
              // @ts-expect-error prop type is string | symbol
              get: (searchParams, prop) => searchParams.get(prop),
            }
          );
          // @ts-expect-error if query param test, go test mode
          if (params.test) {
            data.setSelectedIndex(index);
            data.setResponse("");
            data.setLoading(true);
            setTimeout(function () {
              data.setResponse("@@");
              data.setLoading(false);
            }, 2000);
          } else {
            data.setSelectedIndex(index);
            data.setResponse("");
            data.setLoading(true);
            let prompt = "Explain the following log: \n";
            let content = data.logs[index];
            if (data.logs.length <= 15000) {
              // Lazy hard code way to change prompt
              prompt = "Is there anything suspicious on the following logs: \n";
              content = data.logs.join("\n");
            }
            fetch(
              "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyATrtI1emJyYi7gxvdJRbEKOeWI0u2lELg",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  system_instruction: {
                    parts: { text: "The answer should summarize suspicious and non-suspicious activities (if any)" },
                  },
                  safetySettings: [
                    {
                      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                      threshold: "BLOCK_NONE",
                    },
                  ],
                  contents: [
                    {
                      parts: [
                        {
                          text: `${prompt} ${content}`,
                        },
                      ],
                    },
                  ],
                }),
              }
            )
              .then((response) => response.json())
              .then((json) => {
                data.setResponse(json.candidates[0].content.parts[0].text);
                data.setLoading(false);
              });
          }
        }}
      >
        <ListItemText primary={data.logs[index]} />
      </ListItemButton> */}
      <Typography>{data.logs[index]}</Typography>
    </Box>
  );
};

const Home = () => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectLogType, setSelectLogType] = useState("sshd_sample.txt");

  useEffect(() => {
    fetch("/sshd_sample.txt")
      .then((r) => r.text())
      .then((text) => {
        setLogs(text.split("\n"));
      });
  }, []);

  return (
    <>
      <Container
        sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Log Type</InputLabel>
            <Select
              label="Log Type"
              value={selectLogType}
              onChange={(event) => {
                setSelectLogType(event.target.value);
                fetch(`/${event.target.value}`)
                  .then((r) => r.text())
                  .then((text) => {
                    setLogs(text.split("\n"));
                  });
              }}
            >
              <MenuItem value={"sshd_sample.txt"}>
                [SSHD] Full Logs (2000 lines)
              </MenuItem>
              <MenuItem value={"mix_good_bad_sshd_log.txt"}>
                [SSHD] Mixed Good Bad Logs (12 lines)
              </MenuItem>
              <MenuItem value={"Windows_2k.log"}>
                [WIN] Windows Logs (2000 lines)
              </MenuItem>
              <MenuItem value={"Thunderbird_2k.log"}>
                [THU] Thunderbird Logs (2000 lines)
              </MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => {
              const params = new Proxy(
                new URLSearchParams(window.location.search),
                {
                  // @ts-expect-error prop type is string | symbol
                  get: (searchParams, prop) => searchParams.get(prop),
                }
              );
              // @ts-expect-error if query param test, go test mode
              if (params.test) {
                setResponse("");
                setLoading(true);
                setTimeout(function () {
                  setResponse("@@");
                  setLoading(false);
                }, 2000);
              } else {
                setResponse("");
                setLoading(true);
                const prompt =
                  "Is there anything suspicious on the following logs: \n";
                const content = logs.join("\n");
                fetch(
                  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyATrtI1emJyYi7gxvdJRbEKOeWI0u2lELg",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      system_instruction: {
                        parts: {
                          text: "The answer should summarize suspicious and non-suspicious activities (if any). Please explain it on a scale of 1 to 10",
                        },
                      },
                      safetySettings: [
                        {
                          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                          threshold: "BLOCK_NONE",
                        },
                      ],
                      contents: [
                        {
                          parts: [
                            {
                              text: `${prompt} ${content}`,
                            },
                            {
                              text: "\nFinally, provide a summary on the incident with actionable next steps.",
                            },
                          ],
                        },
                      ],
                    }),
                  }
                )
                  .then((response) => response.json())
                  .then((json) => {
                    setResponse(json.candidates[0].content.parts[0].text);
                    setLoading(false);
                  });
              }
            }}
          >
            AI
          </Button>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FixedSizeList
            height={600}
            itemCount={logs.length}
            itemSize={75}
            width={600}
            itemData={{
              logs,
            }}
          >
            {ReactWindowRow}
          </FixedSizeList>
          <Box>
            <Typography component="span">
              {!loading ? (
                <Markdown>{response}</Markdown>
              ) : (
                <>
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Home;

import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CloseButton,
  Divider,
  IconButton,
  Image,
  NumberInput,
  Select,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CollectModules } from "../graphql/generated";
import { TextField, Button } from "@mui/material";
import { BiImageAdd } from "react-icons/bi";
import { IoSend } from "react-icons/io5";
import useCreateComment from "../lib/useCreateComment";
type Args = {
  publicationId: any;
};
export default function CreateComment({ publicationId }: Args) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [advancedOptions, setAdvancedOptions] = useState<boolean>(false);
  const [collectModule, setCollectModule] = useState<CollectModules>(
    CollectModules.FreeCollectModule
  );
  const [collectFollowerOnly, setCollectFollowerOnly] =
    useState<boolean>(false);
  const [feeCollectValue, setFeeCollectValue] = useState<string>("");
  const [limitedFeeLimit, setLimitedFeeLimit] = useState<string>("");
  // const [referralFee, setReferrealFee] = useState<number>(10.5);
  const { mutateAsync: createComment } = useCreateComment();
  // console.log("imagePath: ", imagePath);
  // console.log("image: ", image);
  // console.log("title: ", title);
  // console.log("description: ", description);
  // console.log("content: ", content);
  // console.log("advancedOptions: ", advancedOptions);
  // console.log("collectModule: ", collectModule);
  // console.log("collectFollowerOnly: ", collectFollowerOnly);
  // console.log("feeCollectValue: ", feeCollectValue);
  // console.log("limitedFeeLimit: ", limitedFeeLimit);
  // useEffect(() => {}, [image, imagePath]);
  return (
    // <Box width="100%" display="flex" flexDir="column" alignItems="center" boxShadow="dark-lg" borderRadius="7px">

    // </Box>
    <Card width="100%">
      <CardBody
        width="100%"
        display="flex"
        flexDir="column"
        gap="8px"
        justifyContent="flex-start"
      >
        <Box
          width="100"
          display="flex"
          flexDir="row"
          justifyContent="flex-start"
          gap="8px"
        >
          <Box
            width="50%"
            display="flex"
            flexDir="column"
            justifyContent="flex-start"
            gap="8px"
          >
            <TextField
              inputProps={{ style: { fontSize: "small" } }}
              label="Title"
              variant="outlined"
              size="small"
              // color="warning"
              // style={{ backgroundColor: "#501030" }}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            ></TextField>
            <TextField
              inputProps={{ style: { fontSize: "small" } }}
              // InputLabelProps={{ style: { justifyContent: "center" } }}
              label="Description"
              variant="outlined"
              size="small"
              multiline
              rows={2}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            ></TextField>
            <Switch
              color="#501030"
              fontSize="sm"
              size="sm"
              onChange={(e) => {
                setAdvancedOptions(e.target.checked);
                if (!e.target.checked) {
                  setCollectModule(CollectModules.FreeCollectModule);
                  setCollectFollowerOnly(false);
                  setFeeCollectValue("");
                  setLimitedFeeLimit("");
                }
              }}
            >
              Advanced options
            </Switch>
          </Box>
          <Box
            width="50%"
            display="flex"
            flexDir="column"
            justifyContent="flex-start"
          >
            <TextField
              inputProps={{ style: { fontSize: "small" } }}
              // InputLabelProps={{ style: { fontSize: "small" } }}
              label="Content"
              variant="outlined"
              size="small"
              multiline
              rows={5}
              onChange={(e) => {
                setContent(e.target.value);
              }}
            ></TextField>
          </Box>
        </Box>
        {advancedOptions && (
          <Box
            width="100%"
            display="flex"
            flexDir="row"
            flexWrap="wrap"
            justifyContent="flex-start"
            gap="16px"
            alignItems="center"
          >
            <Select
              maxW="40%"
              placeholder="Select collect module"
              onChange={(e) => setCollectModule(e.target.value)}
              size="sm"
            >
              <option value={CollectModules.FreeCollectModule}>
                Free Collect Module
              </option>
              <option value={CollectModules.FeeCollectModule}>
                Fee Collect Module
              </option>
              <option value={CollectModules.LimitedFeeCollectModule}>
                Limited Fee Collect Module
              </option>
              <option value={CollectModules.RevertCollectModule}>
                Revert Collect Module
              </option>
            </Select>
            <Switch
              fontSize="sm"
              size="sm"
              color="#501030"
              onChange={(e) => {
                setCollectFollowerOnly(e.target.checked);
              }}
            >
              Follower Only
            </Switch>
            {collectModule == CollectModules.FeeCollectModule && (
              <TextField
                inputProps={{ style: { fontSize: "small" } }}
                InputLabelProps={{ style: { fontSize: "small" } }}
                size="small"
                label="Fee Value (WETH)"
                variant="filled"
                type="number"
                style={{ width: "30%" }}
                onChange={(e) => {
                  setFeeCollectValue(e.target.value);
                }}
              ></TextField>
            )}
            {collectModule == CollectModules.LimitedFeeCollectModule && (
              <Box
                display="flex"
                flexDir="row"
                justifyContent="flex-start"
                width="60%"
                gap="10%"
                paddingBottom="10px"
              >
                <TextField
                  inputProps={{ style: { fontSize: "small" } }}
                  InputLabelProps={{ style: { fontSize: "small" } }}
                  label="Fee Value (WETH)"
                  size="small"
                  variant="filled"
                  type="number"
                  style={{ width: "50%" }}
                  onChange={(e) => {
                    setFeeCollectValue(e.target.value);
                  }}
                ></TextField>
                <TextField
                  inputProps={{ style: { fontSize: "small" } }}
                  InputLabelProps={{ style: { fontSize: "small" } }}
                  label="Limit"
                  variant="filled"
                  size="small"
                  type="number"
                  style={{ width: "40%" }}
                  onChange={(e) => {
                    setLimitedFeeLimit(e.target.value);
                  }}
                ></TextField>
              </Box>
            )}
          </Box>
        )}
      </CardBody>
      {imagePath && (
        <Box
          paddingLeft="8%"
          // paddingRight="4%"
          height="100%"
          width="100%"
          display="flex"
          flexDir="row"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            style={{
              objectFit: "fill",
              maxWidth: "100%",
              borderRadius: "7px",
              paddingBottom: "2px",
              maxHeight: "300px",
            }}
            src={imagePath}
          ></Image>
          <Button
            style={{
              color: "#501030",
              padding: "0",
            }}
            onClick={(e) => {
              setImagePath("");
              setImage(null);
              return;
            }}
          >
            <IconButton
              variant="ghost"
              aria-label="delete image"
              icon={<CloseButton />}
            />
          </Button>
        </Box>
      )}
      <Divider color="gray"></Divider>
      <CardFooter
        width="100%"
        display="flex"
        flexDir="row"
        justifyContent="Right"
        gap="8px"
        paddingTop="1%"
        paddingBottom="1%"
      >
        <Button
          variant="text"
          component="label"
          endIcon={<BiImageAdd color="#501030" />}
        >
          <input
            hidden
            type="file"
            onChange={(e) => {
              console.log(e);
              if (e.target.files) {
                setImage(e.target.files[0]);
                setImagePath(URL.createObjectURL(e.target.files[0]));
              }
            }}
          ></input>
        </Button>
        <Button
          variant="text"
          endIcon={<IoSend color="#501030" />}
          size="large"
          onClick={async () => {
            await createComment({
              publicationId,
              image: image,
              title: title,
              description: description,
              content: content,
              followerOnly: collectFollowerOnly,
              collectModule: collectModule,
              collectFeeValue: feeCollectValue,
              collectLimit: limitedFeeLimit,
            });
          }}
        ></Button>
      </CardFooter>
    </Card>
  );
}

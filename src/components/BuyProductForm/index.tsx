import {
  Button,
  FormControl,
  FormLabel,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { FC, useEffect } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { abi, contractAddress } from "../../../constants/croplink";

import { parseWeiToEth } from "@/utils/parseProductPrice";

type Product = {
  name: string;
  price: number;
  quantity: number;
  index: number;
  farmer: string;
};

const BuyProductForm: FC<{
  details: Product | null;
  onClose: () => void;
  refetchListings: () => void;
}> = ({ details, onClose, refetchListings }) => {
  const toast = useToast();

  const { config, error } = usePrepareContractWrite({
    address: contractAddress,
    abi,
    functionName: "purchaseProduce",
    args: [details?.farmer, details?.index],
    value: details?.price * details?.quantity,
  });

  const { data, write, isLoading } = useContractWrite(config);

  const { isLoading: isBuyLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const onBuyProduct = () => {
    if (write) write();
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error buying product",
        description: error.message,
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
      refetchListings();

      toast({
        title: "Product sale successful",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [isSuccess, onClose, toast, refetchListings]);

  if (!details) return null;

  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Buy product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={3}>
            <FormControl id="product-name">
              <FormLabel>{`Product: ${details.name}`}</FormLabel>
            </FormControl>

            <FormControl id="product-price">
              <FormLabel>{`Price: ${parseWeiToEth(details.price)}`}</FormLabel>
            </FormControl>

            <FormControl id="product-quantity">
              <FormLabel>{`Quantity: ${details.quantity}`}</FormLabel>
            </FormControl>

            <FormControl id="total">
              <FormLabel fontWeight="bold">{`Total: ${parseWeiToEth(
                details.quantity * details.price
              )} ETH`}</FormLabel>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="teal"
            mr={3}
            onClick={onBuyProduct}
            isLoading={isLoading || isBuyLoading}
          >
            Buy
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
};

export default BuyProductForm;
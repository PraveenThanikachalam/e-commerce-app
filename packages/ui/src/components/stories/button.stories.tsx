import { Button } from "../ui/Button";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Button> = {
    title: "UI/Button",
    component: Button,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Buynow_button: Story = {
    args: {
        variant: "buy_now",
        size: "lg",
        children: "BUY NOW",
        disabled: false,
    },
};

export const Wishlist_Button: Story = {
    args: {
        variant: "wishlist",
        size: "lg",
        children: "🩷 ADD TO WISHLIST",
        disabled: false,
    },
};

export const Send_Button: Story = {
    args: {
        variant: "send",
        size: "lg",
        children: "SEND",
        disabled: false,
    },
};

export const Select_Button: Story = {
    args: {
        variant: "select",
        children: "S",
        disabled: false,
    },
};

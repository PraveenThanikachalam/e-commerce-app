import ItemCard from "../ui/ItemCard";
import { Meta, StoryObj } from "@storybook/react/*";

const meta: Meta<typeof ItemCard> = {
    title: "UI/Item_card",
    component: ItemCard,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof ItemCard>;

export const Card: Story = {
    args: {},
};

import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";
import * as process from "node:process";

import { Roles } from "../constants/roles";
import { generateSlug } from "../utils/generateSlug";

const prisma = new PrismaClient();

async function main() {
    // Generate Roles
    const roles = [
        { id: 1, role: Roles.SUPERADMIN },
        { id: 2, role: Roles.CUSTOMER },
    ];
    const createdRoles = await Promise.all(
        roles.map(
            async (role) => await prisma.role.upsert({ where: role, update: {}, create: role }),
        ),
    );
    console.log("ROLES:", createdRoles);

    // Generate Super Admin User
    const hashAdminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 5);
    const { password: adminPassword, ...superAdminUser } = await prisma.user.upsert({
        where: { id: 1, email: "admin@admin.com" },
        update: {},
        create: {
            id: 1,
            email: "admin@admin.com",
            fistName: "Admin",
            lastName: "Admin",
            password: hashAdminPassword,
            roleId: 1,
        },
    });
    console.log("SUPER_ADMIN_USER:", superAdminUser);

    // Generate Customer User
    const hashCustomerPassword = await bcrypt.hash(process.env.CUSTOMER_PASSWORD, 5);
    const { password: customerPassword, ...customerUser } = await prisma.user.upsert({
        where: { id: 2, email: "customer@customer.com" },
        update: {},
        create: {
            id: 2,
            email: "customer@customer.com",
            fistName: "Customer",
            lastName: "Customer",
            password: hashCustomerPassword,
            roleId: 2,
        },
    });
    console.log("CUSTOMER_USER:", customerUser);

    // Generate Categories
    const categories = Array.from({ length: 20 }).map((_, id) => ({
        id: id + 1,
        name: faker.commerce.department(),
        description: faker.lorem.paragraph(),
    }));

    const createdCategories = await Promise.all(
        categories.map(
            async (category) =>
                await prisma.category.upsert({
                    where: { id: category.id },
                    update: {},
                    create: category,
                }),
        ),
    );
    console.log("CATEGORIES:", createdCategories);

    // Generate Products
    const products = Array.from({ length: 20 }).map((_, id) => {
        const isOnSale = faker.datatype.boolean({ probability: 0.3 });
        const price = faker.commerce.price();
        const salePrice = isOnSale
            ? faker.commerce.price({ min: 0, max: parseFloat(price) })
            : null;
        return {
            id: id + 1,
            name: faker.commerce.productName(),
            slug: generateSlug(faker.commerce.productName()),
            description: faker.commerce.productDescription(),
            images: Array.from({ length: 3 }).map(() =>
                faker.image.url({ width: 960, height: 540 }),
            ),
            price: price,
            isOnSale: isOnSale,
            salePrice: salePrice,
            brand: faker.word.noun(),
            manufacture: faker.word.noun(),
            guarantee: faker.number.int({ min: 12, max: 36 }),
            categoryId: faker.number.int({ min: 1, max: 20 }),
        };
    });

    const createdProducts = await Promise.all(
        products.map(
            async (product) =>
                await prisma.product.upsert({
                    where: { id: product.id },
                    update: {},
                    create: product,
                }),
        ),
    );
    console.log("PRODUCTS:", createdProducts);
}

main()
    .then(() => {
        prisma.$disconnect();
        process.exit(1);
    })
    .catch((error) => {
        prisma.$disconnect();
        console.log(error);
        process.exit(1);
    });

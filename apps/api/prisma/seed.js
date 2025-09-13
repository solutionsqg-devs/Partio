import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed de la base de datos...');
    await prisma.settlement.deleteMany();
    await prisma.expenseSplit.deleteMany();
    await prisma.receipt.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user1 = await prisma.user.create({
        data: {
            email: 'gustavo@partio.com',
            password: hashedPassword,
            name: 'Gustavo',
        },
    });
    const user2 = await prisma.user.create({
        data: {
            email: 'quimey@partio.com',
            password: hashedPassword,
            name: 'Quimey',
        },
    });
    const user3 = await prisma.user.create({
        data: {
            email: 'ana@partio.com',
            password: hashedPassword,
            name: 'Ana',
        },
    });
    const group = await prisma.group.create({
        data: {
            name: 'Viaje a Bariloche',
            description: 'Gastos compartidos del viaje de fin de semana',
            currency: 'ARS',
            ownerId: user1.id,
        },
    });
    await prisma.groupMember.createMany({
        data: [
            { groupId: group.id, userId: user1.id, role: 'OWNER' },
            { groupId: group.id, userId: user2.id, role: 'MEMBER' },
            { groupId: group.id, userId: user3.id, role: 'MEMBER' },
        ],
    });
    const expense1 = await prisma.expense.create({
        data: {
            title: 'Cena en el restaurante',
            description: 'Cena del primer día',
            amount: 15000,
            currency: 'ARS',
            category: 'Comida',
            groupId: group.id,
            creatorId: user1.id,
        },
    });
    const expense2 = await prisma.expense.create({
        data: {
            title: 'Combustible',
            description: 'Nafta para el viaje',
            amount: 8000,
            currency: 'ARS',
            category: 'Transporte',
            groupId: group.id,
            creatorId: user2.id,
        },
    });
    await prisma.expenseSplit.createMany({
        data: [
            { expenseId: expense1.id, userId: user1.id, amount: 5000, type: 'EQUAL' },
            { expenseId: expense1.id, userId: user2.id, amount: 5000, type: 'EQUAL' },
            { expenseId: expense1.id, userId: user3.id, amount: 5000, type: 'EQUAL' },
            { expenseId: expense2.id, userId: user1.id, amount: 2666.67, type: 'EQUAL' },
            { expenseId: expense2.id, userId: user2.id, amount: 2666.67, type: 'EQUAL' },
            { expenseId: expense2.id, userId: user3.id, amount: 2666.66, type: 'EQUAL' },
        ],
    });
    await prisma.currencyRate.createMany({
        data: [
            { fromCurrency: 'USD', toCurrency: 'ARS', rate: 350.0 },
            { fromCurrency: 'ARS', toCurrency: 'USD', rate: 0.00286 },
            { fromCurrency: 'EUR', toCurrency: 'ARS', rate: 380.0 },
        ],
    });
    console.log('✅ Seed completado exitosamente!');
    console.log('📧 Usuarios creados:');
    console.log('   - gustavo@partio.com (password: 123456)');
    console.log('   - quimey@partio.com (password: 123456)');
    console.log('   - ana@partio.com (password: 123456)');
    console.log('🏠 Grupo creado: "Viaje a Bariloche"');
    console.log('💰 Gastos de ejemplo creados con splits');
}
main()
    .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
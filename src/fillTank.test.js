'use strict';

const { fillTank } = require('./fillTank');

/**
 * @typedef {Object} Vehicle
 * @property {number} maxTankCapacity
 * @property {number} fuelRemains
 *
 * @typedef {Object} Customer
 * @property {number} money
 * @property {Vehicle} vehicle
 *
 * @param {Customer} customer
 * @param {number} fuelPrice
 * @param {number} amount
 */

describe('fillTank', () => {
  it('should fill the tank to capacity if amount is not specified', () => {
    const customer = {
      money: 1000,
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 10,
      },
    };
    const fuelPrice = 20; // 20 units per liter

    const expectedFuelRemains = 10 + 40; // 50
    const expectedMoney = 1000 - (40 * 20); // 1000 - 800 = 200

    fillTank(customer, fuelPrice);

    expect(customer.vehicle.fuelRemains).toBeCloseTo(expectedFuelRemains, 1);
    expect(customer.money).toBeCloseTo(expectedMoney, 2);
  });

  it('should fill only what fits if amount exceeds tank capacity', () => {
    const customer = {
      money: 1000,
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 30,
      },
    };
    const fuelPrice = 20;
    const amount = 30;
    const expectedFuelRemains = 30 + 20; // 50
    const expectedMoney = 1000 - (20 * 20); // 1000 - 400 = 600

    fillTank(customer, fuelPrice, amount);

    expect(customer.vehicle.fuelRemains).toBeCloseTo(expectedFuelRemains, 1);
    expect(customer.money).toBeCloseTo(expectedMoney, 2);
  });

  // Test case 3: ALWAYS fill in only what the client can pay.
  it('should fill only what the customer can afford', () => {
    const customer = {
      money: 100, // Can afford 100/20 = 5 liters
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 10,
      },
    };
    const fuelPrice = 20;
    const amount = 30; // Requesting 30L, 40L free space, can only afford 5L
    // Expected: fill 5 liters.
    const expectedFuelRemains = 10 + 5; // 15
    const expectedMoney = 100 - (5 * 20); // 100 - 100 = 0

    fillTank(customer, fuelPrice, amount);

    expect(customer.vehicle.fuelRemains).toBeCloseTo(expectedFuelRemains, 1);
    expect(customer.money).toBeCloseTo(expectedMoney, 2);
  });

  it('should round the poured fuel amount down to the tenth', () => {
    const customer = {
      money: 100, // Can afford 100/10 = 10 liters
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 40, // 10L free space
      },
    };
    const fuelPrice = 10;
    const amount = 10.9; // Requesting 10.9L

    customer.money = 109; // Can afford 10.9L
    customer.vehicle.fuelRemains = 39; // 11L free space

    // const initialFuelRemains = customer.vehicle.fuelRemains;
    // const initialMoney = customer.money;

    fillTank(customer, fuelPrice, amount);

    const customer2 = {
      money: 109.9, // Can afford 10.99L
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 39, // 11L free space
      },
    };
    const fuelPrice2 = 10;
    const amount2 = 10.99; // Requested 10.99L
    const initialFuelRemains2 = customer2.vehicle.fuelRemains;
    const initialMoney2 = customer2.money;

    fillTank(customer2, fuelPrice2, amount2);

    const expectedFuelRemains2 = initialFuelRemains2 + 10.9;
    const expectedMoney2 = initialMoney2 - (10.9 * 10); // 109.9 - 109 = 0.9

    expect(customer2.vehicle.fuelRemains).toBeCloseTo(expectedFuelRemains2, 1);
    expect(customer2.money).toBeCloseTo(expectedMoney2, 2);
  });

  it('should not pour if the rounded amount is less than 2 liters', () => {
    const customer = {
      money: 30, // Can afford 30/20 = 1.5 liters
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 48,
      },
    };
    const fuelPrice = 20;
    const amount = 5; // Requesting 5L, 2L free space, can afford 1.5L

    const initialFuelRemains = customer.vehicle.fuelRemains;
    const initialMoney = customer.money;

    fillTank(customer, fuelPrice, amount);

    expect(customer.vehicle.fuelRemains).toBe(initialFuelRemains);
    expect(customer.money).toBe(initialMoney);
  });

  it('should round the price of purchased fuel to the nearest hundredth',
    () => {
      const customer = {
        money: 100,
        vehicle: {
          maxTankCapacity: 50,
          fuelRemains: 40,
        },
      };
      const fuelPrice = 3.333; // Price that will cause complex rounding
      const amount = 2.5;

      const expectedFuelRemains = 40 + 2.5; // 42.5
      const expectedMoney = 100 - 8.33; // 91.67

      fillTank(customer, fuelPrice, amount);

      expect(customer.vehicle.fuelRemains).toBeCloseTo(expectedFuelRemains, 1);
      expect(customer.money).toBeCloseTo(expectedMoney, 2);
    });

  // Additional test case: Tank is already full
  it('should not fill if the tank is already full', () => {
    const customer = {
      money: 500,
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 50, // Tank is full
      },
    };
    const fuelPrice = 10;
    const amount = 10;
    const initialFuelRemains = customer.vehicle.fuelRemains;
    const initialMoney = customer.money;

    fillTank(customer, fuelPrice, amount);

    expect(customer.vehicle.fuelRemains).toBe(initialFuelRemains);
    expect(customer.money).toBe(initialMoney);
  });

  it('should fill exactly 2 liters if customer has just enough money for min',
    () => {
      const customer = {
        money: 40, // Can afford 40/20 = 2 liters
        vehicle: {
          maxTankCapacity: 50,
          fuelRemains: 10,
        },
      };
      const fuelPrice = 20;
      const amount = 10; // Requesting 10L, 40L free, can afford 2L

      const expectedFuelRemains = 10 + 2; // 12
      const expectedMoney = 40 - (2 * 20); // 0

      fillTank(customer, fuelPrice, amount);

      expect(customer.vehicle.fuelRemains).toBeCloseTo(expectedFuelRemains, 1);
      expect(customer.money).toBeCloseTo(expectedMoney, 2);
    });

  it('should not pour if requested amount is less than 2 l',
    () => {
      const customer = {
        money: 100, // Can afford 100/20 = 5 liters
        vehicle: {
          maxTankCapacity: 50,
          fuelRemains: 49, // 1L free space
        },
      };
      const fuelPrice = 20;
      const amount = 1; // Requesting 1L

      const initialFuelRemains = customer.vehicle.fuelRemains;
      const initialMoney = customer.money;

      fillTank(customer, fuelPrice, amount);

      expect(customer.vehicle.fuelRemains).toBe(initialFuelRemains);
      expect(customer.money).toBe(initialMoney);
    });

  it('should correctly round price for complex calculations', () => {
    const customer = {
      money: 200,
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 40, // 10L free
      },
    };
    const fuelPrice = 1.2345; // Price with many decimals
    const amount = 5; // Fill 5L
    // Cost = 5 * 1.2345 = 6.1725
    // Rounded cost = 6.17
    const expectedFuelRemains = 40 + 5; // 45
    const expectedMoney = 200 - 6.17; // 193.83

    fillTank(customer, fuelPrice, amount);
    expect(customer.vehicle.fuelRemains).toBeCloseTo(expectedFuelRemains, 1);
    expect(customer.money).toBeCloseTo(expectedMoney, 2);
  });

  // Test case for zero fuel remains
  it('should fill correctly when fuelRemains is zero', () => {
    const customer = {
      money: 1000,
      vehicle: {
        maxTankCapacity: 50,
        fuelRemains: 0,
      },
    };
    const fuelPrice = 20;
    const amount = 50; // Requesting full tank
    const expectedFuelRemains = 0 + 50; // 50
    const expectedMoney = 1000 - (50 * 20); // 0

    fillTank(customer, fuelPrice, amount);
    expect(customer.vehicle.fuelRemains).toBeCloseTo(expectedFuelRemains, 1);
    expect(customer.money).toBeCloseTo(expectedMoney, 2);
  });
});

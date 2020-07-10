import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

interface IProducts {
  product_id: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found.');
    }

    const allProducts = await this.productsRepository.findAllById(products);

    if (allProducts.length !== products.length) {
      throw new AppError('Product not found.');
    }

    const p: IProducts[] = [];

    allProducts.forEach(allProd => {
      products.forEach(prod => {
        if (allProd.id === prod.id) {
          if (allProd.quantity < prod.quantity) {
            throw new AppError('Insuficient quantity of product');
          }
          p.push({
            product_id: allProd.id,
            price: allProd.price,
            quantity: prod.quantity,
          });
        }
      });
    });

    await this.productsRepository.updateQuantity(products);

    const order = await this.ordersRepository.create({
      customer,
      products: p,
    });

    return order;
  }
}

export default CreateOrderService;

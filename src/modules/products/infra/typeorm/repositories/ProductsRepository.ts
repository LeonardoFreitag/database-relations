import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const product = await this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    const allProductsById = await this.ormRepository.findByIds(products);

    return allProductsById;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO

    const productsFind = await this.ormRepository.findByIds(products);

    productsFind.forEach(async prodFind => {
      products.forEach(async prod => {
        if (prodFind.id === prod.id) {
          const updatedProd = prodFind;
          updatedProd.quantity -= prod.quantity;
          await this.ormRepository.save(updatedProd);
        }
      });
    });

    const updatedProducts = await this.ormRepository.findByIds(products);
    return updatedProducts;
  }
}

export default ProductsRepository;

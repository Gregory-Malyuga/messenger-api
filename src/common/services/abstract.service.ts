import { Injectable } from '@nestjs/common';
import { In, JsonContains, Repository } from 'typeorm';
import { AbstractFilterDto } from '../dto/abstract.filter-dto';
import { Pagination } from '../dto/pagination.dto';

@Injectable()
export class AbstractService<Entity> {
  constructor(protected repository: Repository<Entity>) {}

  async findOne(filter: AbstractFilterDto): Promise<Entity> {
    return await this.repository.findOneOrFail({
      where: this.processFilter(filter),
    });
  }

  async findAndCount(
    filter: AbstractFilterDto,
    pagination: Pagination,
  ): Promise<[Entity[], number]> {
    return await this.repository.findAndCount({
      where: this.processFilter(filter),
      skip: pagination.offset,
      take: pagination.limit,
    });
  }

  private processFilter(filter: AbstractFilterDto): object {
    const where = {};
    this.repository.metadata.columns.map((column) => {
      if (filter[column.propertyName]) {
        where[column.propertyName] = filter[column.propertyName];
        if (column.type === 'json') {
          filter[column.propertyName] = JsonContains(
            where[column.propertyName],
          );
        } else if (Array.isArray(filter[column.propertyName])) {
          where[column.propertyName] = In(filter[column.propertyName]);
        }
      }
    });
    return where;
  }

  async create(dto: any): Promise<Entity> {
    return await this.repository.save(dto);
  }

  async update(dto: any, id: number): Promise<Entity> {
    return await this.findOne({ id: id }).then((model) =>
      this.repository.save({ ...model, ...dto }),
    );
  }

  async delete(id: number): Promise<boolean> {
    await this.findOne({ id: id }).then((model) =>
      this.repository.remove(model),
    );
    return true;
  }
}

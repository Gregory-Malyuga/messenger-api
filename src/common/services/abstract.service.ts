import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/common/dto/pagination.dto';
import { In, JsonContains, Repository } from 'typeorm';
import { AbstractFilterDto } from '../dto/abstract.filter-dto';

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

  async update(dto: any, filter: AbstractFilterDto): Promise<Entity> {
    return await this.findOne(filter).then((model) =>
      this.repository.save({ ...model, ...dto }),
    );
  }

  async delete(filter: AbstractFilterDto): Promise<boolean> {
    await this.findOne(filter).then((model) => this.repository.remove(model));
    return true;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Student } from './entitites/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Course } from './entitites/course.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly datasource: DataSource,
    private readonly configService: ConfigService,
  ) {
    const databaseHost = this.configService.get<string>('DATABASE_HOST');
    console.log(databaseHost);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.studentRepository.find({
      relations: {
        courses: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOne({
      where: { id: +id },
      relations: {
        courses: true,
      },
    });
    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }
    return student;
  }

  async create(createStudentDto: CreateStudentDto) {
    const courses = await Promise.all(
      createStudentDto.courses.map((name) => this.preloadCourseByName(name)),
    );

    const student = this.studentRepository.create({
      ...createStudentDto,
      courses,
    });
    return this.studentRepository.save(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const courses =
      updateStudentDto.courses &&
      (await Promise.all(
        updateStudentDto.courses.map((name) => this.preloadCourseByName(name)),
      ));

    const student = await this.studentRepository.preload({
      id: +id,
      ...updateStudentDto,
      courses,
    });
    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }
    return this.studentRepository.save(student);
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    return this.studentRepository.remove(student);
  }

  private async preloadCourseByName(name: string): Promise<Course> {
    const existingCourse = await this.courseRepository.findOne({
      where: { name }, // {name: name}
    });
    if (existingCourse) {
      return existingCourse;
    }
    return this.courseRepository.create({ name });
  }

  async recommendStudent(student: Student) {
    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      student.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommen_student';
      recommendEvent.type = 'student';
      recommendEvent.payload = { studentId: student.id };

      await queryRunner.manager.save(student);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}

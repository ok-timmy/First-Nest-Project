import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarksById(userId: number, bookmarkNumber: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkNumber,
        userId,
      },
    });
  }

  async createBookmarks(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return bookmark;
  }

  async editBookmarks(
    userId: number,
    bookmarkNumber: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkNumber,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to the bookmark denied');
    } else {
      return this.prisma.bookmark.update({
        where: {
          id: bookmarkNumber,
        },
        data: {
          ...dto,
        },
      });
    }
  }

  async deleteBookmarks(userId: number, bookmarkNumber: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkNumber,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to the bookmark denied');
    }
    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkNumber,
      },
    });
  }
}

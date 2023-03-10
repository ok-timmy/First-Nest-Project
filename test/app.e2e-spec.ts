import { PrismaService } from '../src/prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto/edit-user.dto';
import { EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3334);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'okunolatimilehin4123@gmail.com',
      password: 'Timmy12345',
    };
    describe('Sign Up', () => {
      it('To Throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('To Throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('To Throw error if dto is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('To Sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign In', () => {
      // let accesstoken: string;
      it('To Throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('To Throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('To Throw error if dto is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('To sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAT', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .expectStatus(200)
          .inspect();
      });
    });

    describe('Edit User', () => {
      const dto: EditUserDto = {
        firstName: 'Timilehin',
        lastName: 'Okunola',
        email: 'oktimmy45@gmail.com',
      };
      it('should Edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get Empty Bookmark', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .expectStatus(200)
          .expectBody([])
          .inspect();
      });
    });

    describe('Create Bookmark', () => {
      it('should create a new bookmark', () => {
        const dto = {
          title: 'My first link',
          description: 'This is my very first ever link',
          link: 'https://www.flashscore.com',
        };

        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get Bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .expectStatus(200)
          .expectJsonLength(1)
          .inspect();
      });
    });

    describe('Get Bookmarks by Id', () => {
      it('should get bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .expectStatus(200)
          .inspect()
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Update Bookmarks', () => {
      const dto: EditBookmarkDto = {
        title: 'First Bookmark Updated',
        description: 'I have successfully updated my first bookmark',
        link: 'https://www.updatedlink.com',
      };
      it('should Update bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Delete Bookmarks', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .expectStatus(204)
          .inspect();
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', 'Bearer $S{userAT}')
          .expectStatus(200)
          .expectJsonLength(0)
          .inspect();
      });
    });
  });

});

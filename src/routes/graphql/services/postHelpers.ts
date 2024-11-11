export const createPost = async (dto, prisma) => {
    return await prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId: dto.authorId,
      },
    });
  };
  
  export const changePost = async (id, dto, prisma) => {
    return await prisma.post.update({
      where: { id },
      data: dto,
    });
  };
  
  export const deletePost = async (id, prisma) => {
    return await prisma.post.delete({
      where: { id },
    });
  };
  
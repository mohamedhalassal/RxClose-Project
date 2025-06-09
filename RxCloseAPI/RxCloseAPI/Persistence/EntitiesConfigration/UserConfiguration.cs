using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RxCloseAPI.Entities;

namespace RxCloseAPI.Persistence.EntitiesConfiguration;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasIndex(x => x.UserName).IsUnique();
        builder.HasIndex(x => x.Email).IsUnique();

        builder.Property(x => x.UserName).HasMaxLength(50);
        builder.Property(x => x.Name).HasMaxLength(100);
        builder.Property(x => x.Email).HasMaxLength(100);
        builder.Property(x => x.Password).HasMaxLength(100);
        builder.Property(x => x.Location).HasMaxLength(100);
        builder.Property(x => x.Role).HasMaxLength(20).HasDefaultValue("user");
    }
}
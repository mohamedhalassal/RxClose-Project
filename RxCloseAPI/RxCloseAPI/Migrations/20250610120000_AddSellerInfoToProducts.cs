using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RxCloseAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerInfoToProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Make PharmacyId nullable
            migrationBuilder.AlterColumn<int>(
                name: "PharmacyId",
                table: "Products",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            // Add SellerType column
            migrationBuilder.AddColumn<string>(
                name: "SellerType",
                table: "Products",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "pharmacy");

            // Add SellerName column
            migrationBuilder.AddColumn<string>(
                name: "SellerName",
                table: "Products",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true);

            // Update existing products to set SellerType and SellerName
            migrationBuilder.Sql(@"
                UPDATE Products 
                SET SellerType = 'pharmacy',
                    SellerName = (SELECT Name FROM Pharmacies WHERE Id = Products.PharmacyId)
                WHERE PharmacyId IS NOT NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove the new columns
            migrationBuilder.DropColumn(
                name: "SellerType",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SellerName",
                table: "Products");

            // Make PharmacyId non-nullable again
            migrationBuilder.AlterColumn<int>(
                name: "PharmacyId",
                table: "Products",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
} 
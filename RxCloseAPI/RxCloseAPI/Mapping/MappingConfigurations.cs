using Mapster;
using RxCloseAPI.DTOs;
using RxCloseAPI.Entities;

namespace RxCloseAPI.Mapping
{
    public class MappingConfigurations : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Product to ProductDto mapping
            config.NewConfig<Product, ProductDto>()
                .Map(dest => dest.PharmacyName, src => src.Pharmacy != null ? src.Pharmacy.Name : null)
                .Map(dest => dest.SellerType, src => src.SellerType)
                .Map(dest => dest.SellerName, src => src.SellerName);

            // CreateProductDto to Product mapping
            config.NewConfig<CreateProductDto, Product>()
                .Map(dest => dest.SellerType, src => src.SellerType)
                .Map(dest => dest.PharmacyId, src => src.PharmacyId)
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.CreatedAt)
                .Ignore(dest => dest.Pharmacy)
                .Ignore(dest => dest.OrderItems)
                .Ignore(dest => dest.SellerName); // This will be set by the service
        }
    }
}

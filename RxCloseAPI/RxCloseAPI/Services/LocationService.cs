namespace RxCloseAPI.Services;

public interface ILocationService
{
    double CalculateDistance(double lat1, double lon1, double lat2, double lon2);
    string FormatDistance(double distance);
}

public class LocationService : ILocationService
{
    /// <summary>
    /// Calculate distance between two points using Haversine formula
    /// </summary>
    /// <param name="lat1">Latitude of first point</param>
    /// <param name="lon1">Longitude of first point</param>
    /// <param name="lat2">Latitude of second point</param>
    /// <param name="lon2">Longitude of second point</param>
    /// <returns>Distance in kilometers</returns>
    public double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        Console.WriteLine($"Calculating distance between ({lat1}, {lon1}) and ({lat2}, {lon2})");
        
        const double R = 6371; // Earth's radius in kilometers
        
        double dLat = DegreesToRadians(lat2 - lat1);
        double dLon = DegreesToRadians(lon2 - lon1);
        
        Console.WriteLine($"dLat: {dLat}, dLon: {dLon}");
        
        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                   Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        
        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        double distance = R * c;
        
        Console.WriteLine($"a: {a}, c: {c}, raw distance: {distance}");
        
        var roundedDistance = Math.Round(distance, 2);
        Console.WriteLine($"Final rounded distance: {roundedDistance} km");
        
        return roundedDistance; // Round to 2 decimal places
    }
    
    /// <summary>
    /// Convert degrees to radians
    /// </summary>
    private double DegreesToRadians(double degrees)
    {
        return degrees * (Math.PI / 180);
    }
    
    /// <summary>
    /// Format distance for display
    /// </summary>
    public string FormatDistance(double distance)
    {
        if (distance < 1)
        {
            return $"{Math.Round(distance * 1000)} m";
        }
        return $"{distance} km";
    }
} 